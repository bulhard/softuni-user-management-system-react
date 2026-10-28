import { useState, useEffect } from "react";

import UserSaveModal from "./UserSaveModal";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";
import UserList from "./UserList";

export default function Main() {

    const [displayAddEditUser, setDisplayAddEditUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3030/jsonstore/users', { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch users: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                setUsers(Object.values(data))
            })
            .catch(error => console.error('Error fetching users:', error));
    }, [refresh]);

    const forceUserRefresh = () => {
        setRefresh(state =>!state);
    };

    const addUserClickHanndler = () => {
        setDisplayAddEditUser(true);
    }

    const closeUserModalHanndler = () => {
        setDisplayAddEditUser(false);
    }

    const addUserSubmitHandler = (event) => {
        
        event.preventDefault();

        const formData = new FormData(event.target);

        const { country, city, street, streetNumber, ...userData } = Object.fromEntries(formData);
        userData.address = {
            country,
            city,
            street,
            streetNumber
        };
        userData.createdAt = new Date().toISOString();
        userData.updatedAt = new Date().toISOString();

        fetch('http://localhost:3030/jsonstore/users', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to add user: ${response.status}`);
                }

                return response.json();
            })
            .then(() => {
                closeUserModalHanndler();
                forceUserRefresh();
            })
            .catch(error => {
                console.log('Error adding user:', error);
            });
    }

    return (

        <main className="main">
            <section className="card users-container">
                <SearchForm />

                <UserList users={users} forceUserRefresh={forceUserRefresh} />

                <button className="btn-add btn" onClick={addUserClickHanndler}>Add new user</button>

                <Pagination />
            </section>

            {/* Edit user component  */}
            {displayAddEditUser &&
                <UserSaveModal
                    onClose={closeUserModalHanndler}
                    onSubmit={addUserSubmitHandler}
                />
            }
        </main>
    );
}