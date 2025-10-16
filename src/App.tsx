import React, { useCallback, useState } from 'react';
import './App.css';
import logo from './logo512.png';
import { App as AndtdApp, ConfigProvider, theme, Button, Card, Layout, Menu } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { ContestPage } from './pages/ContestPage';
import { ProblemPage } from './pages/ProblemPage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

const { Header, Content, Footer } = Layout

function App() {
    const { defaultAlgorithm, darkAlgorithm } = theme;
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [current, setCurrent] = useState('contests')
    const onMenuClick = useCallback((e: any) => {
        setCurrent(e.key);
    }, [])
    const handleClick = () => {
        setIsDarkMode((previousValue) => !previousValue);
    };
    return (
    <AndtdApp>
    <ConfigProvider theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}>
    <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} style={{ height: '40px' }} alt="Extensions based on clist.by" />
            <div style={{ flex: 1, padding: '0 10px', color: 'white', fontSize: 20, fontWeight: 'bold' }}>clist-ex</div>
            <Menu
                style={{ width: '420px' }}
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={[current]}
                items={[
                    { key: 'contests', label: 'Contests' },
                    { key: 'problems', label: 'Problems' },
                    { key: 'github', label: <a href="https://github.com/chinesedfan/clist-ex" target="_blank">Github</a> },
                    { key: 'settings', label: 'Settings' },
                    { key: 'about', label: 'About' },
                ]}
                onClick={onMenuClick}
            />
            <Button type="primary" onClick={handleClick} style={{ marginLeft: '20px' }}>
                {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </Button>
        </Header>
        <Content style={{ padding: '30px 48px' }}>
            <Card>
                { current === 'contests' && <ContestPage></ContestPage> }
                { current === 'problems' && <ProblemPage></ProblemPage> }
                { current === 'settings' && <SettingsPage></SettingsPage> }
                { current === 'about' && <AboutPage></AboutPage> }
            </Card>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
            clist-ex ©{new Date().getFullYear()} Created by <a href='https://github.com/chinesedfan' target='_blank'>chinesedfan</a>
        </Footer>
    </Layout>
    </ConfigProvider>
    </AndtdApp>
    );
}

export default App;
