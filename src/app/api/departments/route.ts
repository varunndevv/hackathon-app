import { NextRequest, NextResponse } from 'next/server'
import { getAllDepartments } from '@/lib/pageindex'

// GET /api/departments — static department data for contact page
export async function GET(_req: NextRequest) {
  const departments = getAllDepartments()
  return NextResponse.json({ departments })
}
