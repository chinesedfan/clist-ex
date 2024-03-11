import React, { useCallback, useState } from 'react';
import './App.css';
import { Card, Layout, Menu } from 'antd';
import { ProblemPage } from './pages/ProblemPage';
import { AboutPage } from './pages/AboutPage';

const { Header, Content, Footer } = Layout

function App() {
    const [current, setCurrent] = useState('problems')
    const onMenuClick = useCallback((e: any) => {
        setCurrent(e.key);
    }, [])
    return <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '0 20px', color: 'white', fontSize: 20, fontWeight: 'bold' }}>clist-ex</div>
            <Menu
                theme="dark"
                mode="horizontal"
                items={[
                    { key: 'problems', label: 'Problems' },
                    { key: 'github', label: <a href="https://github.com/chinesedfan/clist-ex" target="_blank">Github</a> },
                    { key: 'about', label: 'About' },
                ]}
                onClick={onMenuClick}
            />
        </Header>
        <Content style={{ padding: '30px 48px' }}>
            <Card>
                { current === 'problems' && <ProblemPage></ProblemPage> }
                { current === 'about' && <AboutPage></AboutPage> }
            </Card>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
            clist-ex ©{new Date().getFullYear()} Created by <a href='https://github.com/chinesedfan' target='_blank'>chinesedfan</a>
        </Footer>
    </Layout>;
}

export default App;
