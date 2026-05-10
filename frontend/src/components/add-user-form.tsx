import { useState } from "react";

import axios from "axios";

import { createUser } from "../modules/users/services/user.service";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import { Button } from "../components/ui/button";

export const AddUserForm =
  () => {
    const [formData, setFormData] =
      useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "AGENT",
      });

    const [message, setMessage] =
      useState("");

    const [loading, setLoading] =
      useState(false);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setFormData({
        ...formData,
        [e.target.name]:
          e.target.value,
      });
    };

    const handleSubmit =
      async (
        e: React.FormEvent
      ) => {
        e.preventDefault();

        try {
          setLoading(true);

          setMessage("");

          const response =
            await createUser(
              formData
            );

          setMessage(
            response.message
          );

          setFormData({
            username: "",
            fullName: "",
            email: "",
            phone: "",
            password: "",
            role: "AGENT",
          });
        } catch (error) {
          if (
            axios.isAxiosError(
              error
            )
          ) {
            setMessage(
              error.response
                ?.data
                ?.message ||
                "Failed to create user"
            );
          }
        } finally {
          setLoading(false);
        }
      };

    return (
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h2 className="text-xl font-bold">
          Add User
        </h2>

        {message && (
          <div className="rounded bg-gray-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div>
          <Label>
            Username
          </Label>

          <Input
            name="username"
            value={
              formData.username
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div>
          <Label>
            Full Name
          </Label>

          <Input
            name="fullName"
            value={
              formData.fullName
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div>
          <Label>
            Email
          </Label>

          <Input
            type="email"
            name="email"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div>
          <Label>
            Phone
          </Label>

          <Input
            name="phone"
            value={
              formData.phone
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div>
          <Label>
            Password
          </Label>

          <Input
            type="password"
            name="password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div>
          <Label>
            Role
          </Label>

          <select
            name="role"
            value={
              formData.role
            }
            onChange={
              handleChange
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="ADMIN">
              ADMIN
            </option>

            <option value="TEAM_LEAD">
              TEAM_LEAD
            </option>

            <option value="AGENT">
              AGENT
            </option>

            <option value="QA">
              QA
            </option>
          </select>
        </div>

        <Button
          type="submit"
          loading={loading}
        >
          Create User
        </Button>
      </form>
    );
  };