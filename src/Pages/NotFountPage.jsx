import React from 'react'

const NotFountPage = () => {
  return (
    <>
      <div className="bg-gray-50 w-full h-screen flex justify-center items-center mt-6  " >
      <div className='w-full lg:w-1/2  bg-gray-600 flex flex-col justify-center items-center p-5 rounded-sm relative '>
           <div className='text-center text-[150px] lg:text-[250px] font-bold text-gray-700'>
           <span >4</span>
           <span  className='ml-2'>0</span>
           <span  className='ml-2'>4</span>
           </div>
           <div  className='text-white font-[inter] absolute'>
           <h1  className='text-center text-2xl font-bold '>oops</h1>
           <p  className='text-2xl'>Something went wrong</p>
           <p  className='text-center'>Error 404 Page Not Found</p>
           {/* <div  className='flex justify-center'>
           <button  className='w-3/4  rounded-full bg-blue-900 p-2 mt-2 font-semibold'>Back To Home</button>
           </div> */}
           </div>
      </div>
      
      </div>
    </>
  )
}

export default NotFountPage
