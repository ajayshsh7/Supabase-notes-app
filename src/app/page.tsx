"use client"
import { withAuth } from '../../lib/withAuth'

function Home() {
  return (
    <div>
      <h1>Welcome to your private notes dashboard!</h1>
      <p>You must be logged in to see this.</p>
    </div>
  )
}

export default withAuth(Home)

