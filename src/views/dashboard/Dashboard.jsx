import { useSelector } from 'react-redux';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard/SchoolAdminDashboard';

const Dashboard = () => {
    const loggedUser = useSelector(state => state.globalState?.loggedUser);

    const renderDashboard = () => {
        switch (loggedUser?.role) {
            case 'SUPER_ADMIN':
                return <SuperAdminDashboard />;
            case 'SCHOOL_ADMIN':
                return <SchoolAdminDashboard />;
            case 'TEACHER':
                return <TeacherDashboard />;
            case 'STUDENT':
                return <StudentDashboard />;
            case 'PARENT':
                return <ParentDashboard />;
            default:
                return (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h3>Access Denied</h3>
                        <p>Invalid role or unauthorized access</p>
                    </div>
                );
        }
    };

    return <>{renderDashboard()}</>;
}

export default Dashboard
