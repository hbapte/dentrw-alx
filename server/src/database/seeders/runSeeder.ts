import { exec } from "child_process"
import path from "path"

const runSeeder = () => {
  const seederPath = path.join(__dirname, "sampleData.ts")

  console.log("Running seeder...")

  // Use ts-node to run the seeder
  const child = exec(`npx ts-node ${seederPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`)
      return
    }

    console.log(stdout)
  })

  child.on("exit", (code) => {
    console.log(`Seeder exited with code ${code}`)
  })
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSeeder()
}

export default runSeeder

