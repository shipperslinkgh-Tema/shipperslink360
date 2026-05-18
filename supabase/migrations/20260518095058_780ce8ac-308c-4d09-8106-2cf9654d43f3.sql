UPDATE auth.users
SET encrypted_password = crypt('ChangeMe@2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@shipperslink.com';