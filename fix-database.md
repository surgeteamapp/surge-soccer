# Database Connection Fix Guide

## Current Issue
- Database hostname resolves to IPv6 only
- Connection failing on `db.ssbktnwwybjzaqxujoai.supabase.co:5432`
- All connection attempts failing with "Can't reach database server"

## Solutions to Try

### 1. Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Check if database is active (not paused)
3. Verify connection string in Settings > Database
4. Check connection pooling settings

### 2. Update Connection String
Try these formats in your .env file:

```env
# Option 1: With SSL mode
DATABASE_URL="postgresql://postgres:KZYOfVEclAKAzikQ@db.ssbktnwwybjzaqxujoai.supabase.co:5432/postgres?sslmode=require"

# Option 2: Direct IPv4 (get from Supabase dashboard)
DATABASE_URL="postgresql://postgres:KZYOfVEclAKAzikQ://[IPv4_ADDRESS]:5432/postgres"

# Option 3: With connection pool
DATABASE_URL="postgresql://postgres:KZYOfVEclAKAzikQ@db.ssbktnwwybjzaqxujoai.supabase.co:6543/postgres?pgbouncer=true"
```

### 3. Network Solutions
- Check if port 5432 is blocked by firewall
- Try from different network (mobile hotspot)
- Check VPN/proxy settings

### 4. Supabase Specific
- Restart database in Supabase dashboard
- Check region settings
- Verify password hasn't expired

### 5. Temporary Workaround
While fixing database, use the fallback authentication I implemented:
- Email: coxjuston04@gmail.com
- Password: Call317470admin

## Next Steps
1. Check Supabase dashboard first
2. Try updating connection string with SSL mode
3. Test with IPv4 address if available
4. Contact Supabase support if issues persist
