ALTER TABLE experience_log ADD COLUMN reflection text default null;

CREATE TRIGGER update_experience_log_modtime
    BEFORE UPDATE ON experience_log
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE VIEW experience_log_with_hours AS 
  SELECT
    experience_log.id,
    experience_log.user_id, 
    experience_log.exp_type, 
    experience_log.custom_exp_type, 
    experience_log.activity_description, 
    experience_log.organisation, 
    experience_log.location_site, 
    experience_log.setting, 
    experience_log.duration_note, 
    experience_log.supervisor, 
    experience_log.evidence_reference,
    experience_log.is_recurring, 
    experience_log.start_date, 
    experience_log.end_date, 
    experience_log.hours_per_period, 
    experience_log.frequency_unit, 
    experience_log.head_start_hours, 
    experience_log.total_hours, 
    experience_log.created_at,
    experience_log.updated_at,
    CASE
        WHEN is_recurring = FALSE THEN total_hours
        WHEN is_recurring = TRUE AND end_date IS NULL THEN
            CASE frequency_unit
                WHEN 'week' THEN FLOOR((CURRENT_DATE - start_date) / 7)
                WHEN 'fortnight' THEN FLOOR((CURRENT_DATE - start_date) / 14)
                WHEN 'month' THEN EXTRACT(YEAR FROM age(CURRENT_DATE, start_date))::int * 12
                    + EXTRACT(MONTH FROM age(CURRENT_DATE, start_date))::int
            END * hours_per_period + head_start_hours
        WHEN is_recurring = TRUE AND end_date IS NOT NULL THEN
            CASE frequency_unit
                WHEN 'week' THEN FLOOR((end_date - start_date) / 7)
                WHEN 'fortnight' THEN FLOOR((end_date - start_date) / 14)
                WHEN 'month' THEN EXTRACT(YEAR FROM age(end_date, start_date))::int * 12
                    + EXTRACT(MONTH FROM age(end_date, start_date))::int
            END * hours_per_period + head_start_hours
        ELSE 0
    END AS live_hours,
    experience_log.reflection
   FROM 
       experience_log; 
   