export type Member = {
    id: string;
    name: string;
    email: string;
    role: string;
    space: string;
    status: "Active" | "Pending";
    joined: string;
};