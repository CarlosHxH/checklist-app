import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest, response: NextResponse) {
    /*
    const data = await request.formData()
    console.log(data)
    if(data) return new NextResponse("Thank you")
*/
    const data = await request.json();
    console.log(data)
    if(data) return new NextResponse("Thank you")

    return new NextResponse("Error")
}
