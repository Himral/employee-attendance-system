import React from 'react'
import SearchBox from './SearchBox'
import { Button } from '@/components/ui/button'
import AddNewEmployee from './AddNewEmployee'

function ToolBar() {
    function addNewEmployee(){
        console.log("I clicked on the add new employee button")
    }
  return (
    <div className='flex flex-row bg-yellow-200 p-4 gap-4'>
                <SearchBox/>
                <h2 className='bg-pink-200'>Filter Options</h2>
                <AddNewEmployee/>
            </div>
  )
}

export default ToolBar