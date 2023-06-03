import type { ReactNode } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button } from 'antd';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import React from 'react';
import Image from 'next/image';

type SidebarOption = {
  icon: React.ElementType,
  label: string,
  route: string
}

const Board = ({ children }: { children: ReactNode }) => {
  const { Header, Sider } = Layout;
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarOptions: SidebarOption[] = [
    {
      icon: UserOutlined,
      label: "home",
      route: ''
    },
    {
      icon: LaptopOutlined,
      label: "Backlog",
      route: 'backlog'
    },
    {
      icon: NotificationOutlined,
      label: "Settings",
      route: 'settings'
    },
  ];


  const sidebarMenu: MenuProps['items'] = sidebarOptions.map(
    (option, index) => {
      const key = String(index + 1);
      return {
        key: `sub${key}`,
        icon: React.createElement(option.icon),
        label: option.label,
        onClick: async () => {
          await router.push({
            pathname: `/projects/${router.query.projectId}/${option.route}`,
          });
        },
      };
    },
  );

  return (
    <Layout >
      <Header style={{ color: "white" }} className="flex justify-between items-center">
      <Image src="/logo.svg" width={32} height={32} alt={'dp'} />
        <Button type="dashed" onClick={() => { void signOut() }}>Logout</Button>
      </Header>
      <Layout>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['sub1']}
            defaultOpenKeys={['sub1']}
            items={sidebarMenu}
          />
        </Sider>
        <Layout className='bg-white p-3 gap-1-2 overflow-x-scroll' style={{ height: "calc(100vh - 64px)" }}>
          {children}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Board;