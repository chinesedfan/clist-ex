import React, { useEffect, useState } from 'react';
import './App.css';
import Problem from './types/Problem';
import { ProblemList } from './pages/ProblemList';
import { getProblemList } from './apis';

function App() {
    const [problems, setProblems] = useState<Problem[]>([]);
    useEffect(() => {
        getProblemList().then(setProblems);
    }, [])
    return (
        <div className="App">
            <ProblemList problems={problems} />
        </div>
    );
}

export default App;
