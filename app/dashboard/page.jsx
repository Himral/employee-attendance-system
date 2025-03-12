"use client"
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import AddNewEmployee from './_components/AddNewEmployee';
import ShowEmployees from './_components/ShowEmployees';
import NavigationBar from './_components/NavigationBar';
import ToolBar from './_components/ToolBar';
import Link from "next/link";
function Dashboard() {
  

  return (
    <div>
     <div >
            <div>
                <NavigationBar/>
            </div>
            <div>
                <Link href = {`/dashboard/employeeManagementPage`} >
                <Button className= 'bg-pink-200'>Employee Management Page</Button>
                </Link>
                
            </div>
            <ToolBar/>
            <ShowEmployees/>
        </div>
    </div>
  );
}

export default Dashboard;
