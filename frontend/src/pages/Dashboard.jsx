import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from "react-data-table-component/dist/index.es.js";
import { fetchAllUsers, deleteUser } from '../redux/thunk/adminThunk';
import { setPage, setLimit } from '../redux/slice/adminSlice';
import UserFormModal from '../modal/UserFormModal';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux State
    const { users, loading, total, page, limit } = useSelector((state) => state.admin);

    // Local States
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // 1. Fetch users on Load & when Page/Limit/Search changes
    useEffect(() => {
        dispatch(fetchAllUsers({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    // 2. Edit Handler (Pura user object modal ko dena)
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // 3. Delete Handler
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This user will be permanently removed!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#eb2a2a",
            cancelButtonColor: "#1f2937",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                Swal.fire("Deleted!", "User has been removed.", "success");
                // Refresh list after delete
                dispatch(fetchAllUsers({ page, limit, search }));
            } catch (error) {
                toast.error(error || "Delete failed");
            }
        }
    };

    // 4. Table Columns Definition
    const columns = useMemo(() => [
        {
            name: 'User Info',
            sortable: true,
            minWidth: '280px',
            cell: (row) => (
                <div 
                    className="flex items-center gap-3 py-3 cursor-pointer group transition-all"
                    onClick={() => navigate(`/admin/user-blogs/${row._id}`)} // Redirect to user blogs
                    title="View User Blogs"
                >
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-100 group-hover:border-indigo-400 transition-all">
                        <img
                            src={row.profilePic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                            alt="avatar"
                            className="w-11 h-11 object-cover shadow-sm group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {row.firstName ? `${row.firstName} ${row.lastName}` : row.username}
                        </span>
                        <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-400 transition-colors">{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            name: 'Username',
            selector: row => row.username,
            sortable: true,
            width: '150px',
            cell: (row) => <span className="font-bold text-gray-900">{row.username || 'n/a'}</span>
        },
        {
            name: 'Gender',
            sortable: true,
            width: '120px',
            cell: (row) => (
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${row.gender === 'Male' ? 'bg-blue-50 text-blue-600' :
                        row.gender === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {row.gender || 'N/A'}
                </span>
            )
        },
        {
            name: 'Country',
            selector: row => row.country || 'N/A',
            sortable: true,
            cell: (row) => <span className="font-semibold text-gray-700">{row.country || 'N/A'}</span>
        },
        {
            name: 'DOB',
            selector: row => row.dob,
            sortable: true,
            width: '150px',
            cell: (row) => (
                <span className="font-semibold text-gray-600">
                    {row.dob ? new Date(row.dob).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A'}
                </span>
            )
        },
        {
            name: 'Actions',
            right: true,
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                        title="Edit User"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-90"
                        title="Delete User"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ], [page, limit, search]);

    // 5. Custom Table Styles (Modern UI)
    const customStyles = {
        table: { style: { backgroundColor: '#ffffff' } },
        headCells: {
            style: {
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontWeight: '800',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #f3f4f6'
            },
        },
        rows: {
            style: {
                minHeight: '72px',
                '&:not(:last-child)': { borderBottom: '1px solid #f3f4f6' },
            },
        },
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-10">
            <div className="max-w-6xl mx-auto bg-white shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden border border-gray-100">

                {/* Header Section */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-b from-white to-gray-50/30">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">ADMIN DASHBOARD</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-wider">Total {total} users registered</p>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg> */}
                    </div>
                </div>

                {/* Data Table */}
                <div className="px-4 pb-4">
                    <DataTable
                        columns={columns}
                        data={users}
                        progressPending={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={total}
                        paginationDefaultPage={page}
                        paginationPerPage={limit}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        onChangePage={(p) => dispatch(setPage(p))}
                        onChangeRowsPerPage={(l) => dispatch(setLimit(l))}
                        customStyles={customStyles}
                        highlightOnHover
                        responsive
                        noDataComponent={<div className="p-10 text-gray-400 font-bold italic underline">No users found...</div>}
                    />
                </div>
            </div>

            {/* Reusable Modal Integrated with Admin Logic */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null); // Clean up on close
                }}
                initialData={selectedUser}
                isAdminMode={true}
            />
        </div>
    );
};

export default Dashboard;