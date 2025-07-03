// /app/api/protected/route.js
import jwt from 'jsonwebtoken';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ message: 'Success', user }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403 });
  }
}
