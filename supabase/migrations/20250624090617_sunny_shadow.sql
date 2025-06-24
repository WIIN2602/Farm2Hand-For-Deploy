/*
  # Add set_config function for RLS user context

  1. New Functions
    - `set_config` - Allows setting session variables for RLS policies
      - `setting_name` (text) - The name of the setting to set
      - `setting_value` (text) - The value to set
      - `is_local` (boolean) - Whether to set locally (session-only) or globally

  2. Security
    - Grant execute permissions to anon and authenticated users
    - Function is marked as SECURITY DEFINER for proper permissions

  This function is essential for the RLS policies to work correctly by allowing
  the application to set the current user ID in session variables.
*/

CREATE OR REPLACE FUNCTION public.set_config(
    setting_name text,
    setting_value text,
    is_local boolean DEFAULT false
)
RETURNS text AS $$
BEGIN
    IF is_local THEN
        EXECUTE format('SET LOCAL %I = %L', setting_name, setting_value);
    ELSE
        EXECUTE format('SET %I = %L', setting_name, setting_value);
    END IF;
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.set_config TO anon, authenticated;