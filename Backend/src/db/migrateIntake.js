import pool from '../config/db.js';

async function migrateIntake() {
  console.log('--- Migrating Registrations Table with Intake JSONB ---');
  try {
    await pool.query(`
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS intake JSONB DEFAULT NULL;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_first_time BOOLEAN DEFAULT TRUE;
    `);
    console.log('Columns intake and is_first_time verified/added.');

    const { rows } = await pool.query('SELECT id, health_notes FROM registrations WHERE intake IS NULL');
    console.log(`Found ${rows.length} existing registrations without intake JSON.`);

    for (const row of rows) {
      const text = row.health_notes || '';
      const isFirst = !text.includes('Returning Student');

      let intakeObj;
      if (isFirst) {
        const practicedMatch = text.includes('Practiced before: No') ? 'No' : 'Yes';
        const expMatch = text.includes('Intermediate')
          ? 'Intermediate'
          : text.includes('Advanced')
          ? 'Advanced'
          : 'Beginner';
        const goalMatch = text.match(/Goal:\s*([^•]+)/);
        const goal = goalMatch ? goalMatch[1].trim() : 'Flexibility & Mobility';

        const hasInjuries = text.includes('Injuries/Conditions:') ? 'Yes' : 'No';
        const injuriesMatch = text.match(/Injuries\/Conditions:\s*([^•]+)/);
        const injuriesDetails = injuriesMatch ? injuriesMatch[1].trim() : '';

        const pregStatus = text.includes('Currently Pregnant')
          ? 'Pregnant'
          : text.includes('Recently Given Birth')
          ? 'Postpartum'
          : 'No';

        const noteMatch = text.match(/Instructor Note:\s*"?([^"•]+)"?/);
        const notes = noteMatch ? noteMatch[1].trim() : '';

        intakeObj = {
          practicedBefore: practicedMatch,
          experienceLevel: expMatch,
          mainGoal: goal,
          customGoal: '',
          hasInjuries,
          injuriesDetails,
          pregnancyStatus: pregStatus,
          instructorNotes: notes,
          returningNotes: ''
        };
      } else {
        const updatesMatch = text.match(/Updates:\s*(.+)/);
        intakeObj = {
          practicedBefore: 'Yes',
          experienceLevel: 'Intermediate',
          mainGoal: 'Continued Practice & Mobility',
          customGoal: '',
          hasInjuries: 'No',
          injuriesDetails: '',
          pregnancyStatus: 'No',
          instructorNotes: '',
          returningNotes: updatesMatch ? updatesMatch[1].trim() : text
        };
      }

      await pool.query(
        'UPDATE registrations SET intake = $1, is_first_time = $2 WHERE id = $3',
        [JSON.stringify(intakeObj), isFirst, row.id]
      );
    }

    console.log(`Successfully migrated ${rows.length} registrations.`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrateIntake();
