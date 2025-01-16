import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for server-side calls
const supabase = createClient(
  'https://dhkdfrhlgcpmxhexbtdx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoa2RmcmhsZ2NwbXhoZXhidGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MjQ1NjEsImV4cCI6MjA1MjEwMDU2MX0.vE_SfOIjvPLk778iXlyuRiwEpnGrEFqIrLoddJCQeoM'
)

export { supabase } 