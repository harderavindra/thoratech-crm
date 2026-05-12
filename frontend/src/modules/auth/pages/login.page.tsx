import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {
  loginSchema,
  type LoginFormData,
} from "../validations/login.validation";

import { loginUser } from "../services/auth.service";

import { useAuthStore } from "../store/auth.store";

import { Input } from "../../../components/ui/input";

import { Button } from "../../../components/ui/button";
import Logo from "../../../components/ui/logo";

export const LoginPage =
  () => {
    const navigate =
      useNavigate();

    const setUser =
      useAuthStore(
        (state) =>
          state.setUser
      );

    const [apiError, setApiError] =
      useState("");

    const {
      register,
      handleSubmit,
      formState: {
        errors,
        isSubmitting,
      },
    } =
      useForm<LoginFormData>({
        resolver:
          zodResolver(
            loginSchema
          ),
      });

    const onSubmit =
      async (
        data: LoginFormData
      ) => {
        try {
          setApiError("");

          const response =
            await loginUser(
              data
            );

          setUser(
            response.data.user
          );

          navigate("/");
        } catch (error) {
          if (
            axios.isAxiosError(
              error
            )
          ) {
            setApiError(
              error.response
                ?.data
                ?.message ||
                "Login failed"
            );
          } else {
            setApiError(
              "Something went wrong"
            );
          }
        }
      };

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 ">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-center flex items-center justify-center">
              <Logo size="lg" showWordmark={false}  />
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
            className="space-y-5"
          >
            {apiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            <Input
              label=""
              type="email"
              placeholder="Enter email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label=""
              type="password"
              placeholder="Enter password"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
               variant="primary"
              loading={
                isSubmitting
              }
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  };