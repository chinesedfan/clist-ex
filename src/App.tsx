import React from 'react';
import './App.css';
import { Card, Layout, Menu, theme } from 'antd';
import { ProblemPage } from './pages/ProblemPage';

const { Header, Content, Footer } = Layout

function App() {
    return <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '0 20px', color: 'white', fontSize: 20, fontWeight: 'bold' }}>clist-ex</div>
            <Menu
                theme="dark"
                mode="horizontal"
                items={[
                    { key: 'problems', label: 'Problems' },
                    { key: 'github', label: 'Github' },
                    { key: 'about', label: 'About' },
                ]}
                style={{ flex: 1, minWidth: 0 }}
            />
        </Header>
        <Content style={{ padding: '30px 48px' }}>
            <Card>
                <ProblemPage></ProblemPage>
            </Card>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
            clist-ex ©{new Date().getFullYear()} Created by <a href='https://github.com/chinesedfan' target='_blank'>chinesedfan</a>
        </Footer>
    </Layout>;
}

export default App;
