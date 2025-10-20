// const AsyncHandler = (fn) => (req,res,next) => {
//   Promise.resolve(fn(req,res,next))
//   .catch(err=>{console.log("Error: ",err)});
// }

const AsyncHandler = (fn) => async (req,res,next) => {
  try {
    await fn(req,res,next);
  } catch (error) {
      console.log('error: ',error);
  }
}