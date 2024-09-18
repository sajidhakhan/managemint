"use client";

import React, { useState } from 'react'
import ProjectHeader from '@/app/projects/ProjectHeader';
import Board from '../BoardView';

type Props = { 
    params: {id: string};
}

const page = ({ params }: Props) => {
    const { id } = params;
    const [activeTab, setActiveTab] = useState("Board");
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  return (
    <div>
        <ProjectHeader activeTab = {activeTab} setActiveTab = {setActiveTab} />
        {activeTab === "Board" && (
             <Board id={id} setIsModalNewTaskOpen= {setIsModalNewTaskOpen} />
        )}
       
    </div>
  )
}

export default page