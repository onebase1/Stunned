import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard - in production, you might want to check authentication first
  redirect('/dashboard');
}
