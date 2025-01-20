import { type NextRequest } from 'next/server'
 
export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  // query is "hello" for /api/search?query=hello
  new Response(query)
  //return Response.json({query},{status:202})
}