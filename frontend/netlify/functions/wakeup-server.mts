import type { Config } from '@netlify/functions'

// Keeps the Render backend awake by periodically sending a health check request (because it uses the free plan),
// reducing cold starts when users access the application. 
export default async (req: Request) => {
  const { next_run } = await req.json()

  try {
    const response = await fetch(
      'https://project-work-jpor.onrender.com/api/health',
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      }
    )    
    
    console.log(response.status)
    console.log('Prossima esecuzone: ', next_run)

  } catch (error) {
    console.log(error)
  }
}

export const config: Config = {
  schedule: '*/10 * * * *',
}