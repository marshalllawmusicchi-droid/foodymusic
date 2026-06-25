import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://zwbutfjmqxvjyiuoxiic.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImE1ZDljYmRmLWY5NjYtNDYyNy1iZjVlLTQ5NTE5YzJmNzk3NCJ9.eyJwcm9qZWN0SWQiOiJ6d2J1dGZqbXF4dmp5aXVveGlpYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgyMzczNjg4LCJleHAiOjIwOTc3MzM2ODgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.fXSD0gmYXksoFN1bAIltQaaXylhb10qy7CbvcS7yICw';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };