//search something
const searchdata = async(req,res)=>{
        const searchterm = req.body
}

export default searchdata

// // Search Endpoint
// app.get('/search', async (req, res) => {
//   const searchTerm = req.query.q;

//   if (!searchTerm) {
//     return res.status(400).send({ message: 'Search term is required' });
//   }

//   try {
//     // Search in User model
//     const users = await prisma.user.findMany({
//       where: {
//         OR: [
//           { username: { contains: searchTerm, mode: 'insensitive' } },
//           { email: { contains: searchTerm, mode: 'insensitive' } },
//           { phonenumber: { contains: searchTerm, mode: 'insensitive' } },
//         ],
//       },
//     });

//     // Search in UserProfile model (admin/super admin)
//     const userProfiles = await prisma.userProfile.findMany({
//       where: {
//         OR: [
//           { firstname: { contains: searchTerm, mode: 'insensitive' } },
//           { lastname: { contains: searchTerm, mode: 'insensitive' } },
//           { email: { contains: searchTerm, mode: 'insensitive' } },
//           { phonenumber: { contains: searchTerm, mode: 'insensitive' } },
//         ],
//       },
//     });

//     // Search in Assigntovechicles model (vehicles)
//     const vehicles = await prisma.assigntovechicles.findMany({
//       where: {
//         OR: [
//           { vehiclename: { contains: searchTerm, mode: 'insensitive' } },
//           { vehiclemodel: { contains: searchTerm, mode: 'insensitive' } },
//           { vehiclelicense: { contains: searchTerm, mode: 'insensitive' } },
//         ],
//       },
//     });

//     // Search in Charger_Unit model
//     const chargers = await prisma.charger_Unit.findMany({
//       where: {
//         OR: [
//           { ChargerName: { contains: searchTerm, mode: 'insensitive' } },
//           { Chargerserialnum: { contains: searchTerm, mode: 'insensitive' } },
//           { full_address: { contains: searchTerm, mode: 'insensitive' } },
//         ],
//       },
//     });

//     // Return all the matching results
//     res.json({
//       users,
//       userProfiles,
//       vehicles,
//       chargers,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Something went wrong' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
