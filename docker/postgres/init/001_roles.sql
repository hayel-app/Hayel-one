DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hayel_app') THEN
    CREATE ROLE hayel_app LOGIN PASSWORD 'hayel_app_test_only';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE hayel_test TO hayel_app;
