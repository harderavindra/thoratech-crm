import mongoose, {
    Schema,
    type Document,
    type Model,
} from "mongoose";

import bcrypt from "bcryptjs";

import { UserRole } from "./user.types";

import {
    PASSWORD_COMPLEXITY,
} from "../../constants/auth.constants";

interface PasswordHistory {
    hash: string;
    changedAt: Date;
}

export interface IUser
    extends Document {
    username: string;

    fullName: string;

    email: string;

    phone: string;

    role: UserRole;

    status:
    | "active"
    | "inactive";

    dateOfJoining?: Date;

    lastLogin?: Date;

    password: string;

    passwordHistory: PasswordHistory[];

    passwordChangedAt: Date;

    loginAttempts: number;

    lockoutUntil?: Date | null;

    comparePassword: (
        candidate: string
    ) => Promise<boolean>;

    isPasswordReused: (
        candidate: string
    ) => Promise<boolean>;
}

interface UserModel
    extends Model<IUser> {
    PASSWORD_COMPLEXITY: RegExp;
}

const passwordHistorySchema =
    new Schema<PasswordHistory>(
        {
            hash: {
                type: String,
                required: true,
            },

            changedAt: {
                type: Date,
                default: Date.now,
            },
        },

        {
            _id: false,
        }
    );

const userSchema =
    new Schema<IUser>(
        {
            username: { type: String, required: true, unique: true, trim: true, lowercase: true,},
            fullName: { type: String, required: true, trim: true,},
            email: {type: String, required: true, unique: true, lowercase: true, trim: true,},
            phone: { type: String, required: true, trim: true, },

            role: { type: String, enum: Object.values(UserRole), default: UserRole.AGENT, },

            status: { type: String, enum: ["active", "inactive"], default: "active", },

            dateOfJoining: { type: Date, },

            lastLogin: { type: Date, },

            password: { type: String, required: true, select: false, },

            passwordHistory: { type: [passwordHistorySchema], default: [], select: false, },

            passwordChangedAt: { type: Date, default: Date.now, },

            loginAttempts: { type: Number, default: 0, },

            lockoutUntil: { type: Date, default: null, },
        },

        {
            timestamps: true,
        }
    );

userSchema.index({
    username: 1,
});

userSchema.index({
    email: 1,
});

userSchema.pre(
    "save",
    async function () {
        if (
            !this.isModified(
                "password"
            )
        ) {
            return;
        }

        this.password =
            await bcrypt.hash(
                this.password,
                12
            );
    }
);

userSchema.methods.comparePassword =
    function (
        candidate: string
    ) {
        return bcrypt.compare(
            candidate,
            this.password
        );
    };

userSchema.methods.isPasswordReused =
    async function (
        candidate: string
    ) {
        for (const entry of this
            .passwordHistory) {
            const matched =
                await bcrypt.compare(
                    candidate,
                    entry.hash
                );

            if (matched) {
                return true;
            }
        }

        return false;
    };


export const User =
    mongoose.model<
        IUser,
        UserModel
    >("User", userSchema);