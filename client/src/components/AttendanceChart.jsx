import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const AttendanceChart = ({ history }) => {
    // Process data to count status occurrences
    const statusCounts = {
        PRESENT: 0,
        LATE: 0,
        ABSENT: 0,
        EARLY_LEAVE: 0
    };

    history.forEach(record => {
        if (statusCounts[record.status] !== undefined) {
            statusCounts[record.status]++;
        }
    });

    const data = [
        { name: '출석', count: statusCounts.PRESENT, color: '#10b981' }, // Green
        { name: '지각', count: statusCounts.LATE, color: '#f59e0b' },    // Amber
        { name: '조퇴', count: statusCounts.EARLY_LEAVE, color: '#3b82f6' }, // Blue
        { name: '결석', count: statusCounts.ABSENT, color: '#ef4444' }   // Red
    ];

    return (
        <div className="attendance-chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="횟수" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;
