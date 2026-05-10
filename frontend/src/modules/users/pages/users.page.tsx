import { AddUserForm } from "../../../components/add-user-form";

export const UsersPage =
  () => {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <button className="rounded bg-black px-4 py-2 text-white">
            Add User
          </button>
        </div>

        <div className="overflow-hidden rounded bg-white shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Name
                </th>

                <th className="px-4 py-3 text-left">
                  Email
                </th>

                <th className="px-4 py-3 text-left">
                  Role
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              
              <tr className="border-t">
                <td className="px-4 py-3">
                  Thoratech
                  Admin
                </td>

                <td className="px-4 py-3">
                  admin@thoratech.com
                </td>

                <td className="px-4 py-3">
                  SUPER_ADMIN
                </td>

                <td className="px-4 py-3">
                  active
                </td>
              </tr>
            </tbody>
          </table>
        </div>
         <AddUserForm />
      </div>
    );
  };