import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getNextCounterValue() {
    let counter;
    
    // Fetch the current counter value from the database
    counter = await prisma.counter.findFirst();
    
    if (!counter) {
      // If no counter exists, create one with the initial value of 100
      counter = await prisma.counter.create({
        data: { value: 100 },
      });
    } else {
      // Increment the current counter value by 5
      const newValue = counter.value + 5;
      
      // Update the counter in the database
      counter = await prisma.counter.update({
        where: { id: counter.id },
        data: { value: newValue },
      });
    }
    
    // Return the updated counter value
    return counter.value;
  }
  
export default getNextCounterValue