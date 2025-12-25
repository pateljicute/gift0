-- Function to delete delivered orders older than 7 hours
-- This is called from the frontend src/app/orders/page.tsx

CREATE OR REPLACE FUNCTION delete_old_delivered_orders()
RETURNS void AS $$
BEGIN
  DELETE FROM orders
  WHERE status = 'delivered'
  AND updated_at < (NOW() - INTERVAL '7 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to everyone (since it's called from frontend)
-- The function itself is "SECURITY DEFINER" so it runs with admin privileges to perform the delete
GRANT EXECUTE ON FUNCTION delete_old_delivered_orders() TO postgres, anon, authenticated, service_role;
