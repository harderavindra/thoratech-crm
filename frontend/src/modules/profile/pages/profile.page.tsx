import { useAuthStore } from "../../auth/store/auth.store";

export const ProfilePage =
  () => {
    const user =
      useAuthStore(
        (state) =>
          state.user
      );

    return (
      <div className="rounded bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">
          Profile
        </h1>

        <div className="space-y-2">
          <p>
            <strong>
              Name:
            </strong>{" "}
            {
              user?.fullName
            }
          </p>

          <p>
            <strong>
              Email:
            </strong>{" "}
            {user?.email}
          </p>

          <p>
            <strong>
              Role:
            </strong>{" "}
            {user?.role}
          </p>
        </div>
      </div>
    );
  };