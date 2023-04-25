import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const issueProp = z.object({
    title: z.string(),
    projectId: z.string(),
    workflowId: z.string(),
    index: z.number(),
    description: z.string().optional(),
    createdById: z.string(),
});

export const issueRouter = createTRPCRouter({
    createIssue: protectedProcedure.input(issueProp).mutation(({ ctx, input }) => {
        return ctx.prisma.issue.create({
            data: {
                title: input.title,
                index: input.index,
                workFlowId: input.workflowId,
                description: input.description,
                createdById: input.createdById,
            },
        });
    }),
    getIssueById: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
        return ctx.prisma.issue.findUnique({
            where: {
                id: input.id,
            },
        });
    }),
    getIssuesByWorkflowId: protectedProcedure.input(z.object({ workflowId: z.string() })).query(({ ctx, input }) => {
        return ctx.prisma.issue.findMany({
            where: {
                workFlowId: input.workflowId,
            },
        });
    }),
    deleteIssueById: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return ctx.prisma.issue.delete({
            where: {
                id: input.id,
            },
        });
    }),
    assignIssueToUser: protectedProcedure.input(z.object({ issueId: z.string(), userId: z.array(z.string()) })).mutation(({ ctx, input }) => {
        return ctx.prisma.issue.update({
            where: {
                id: input.issueId,
            },
            data: {
                assignees: {
                    connect: input.userId.map((id) => ({ id })),
                },
            },
        });
    }),
    unassignIssueFromUser: protectedProcedure.input(z.object({ issueId: z.string(), userId:z.string() })).mutation(({ ctx, input }) => {
        return ctx.prisma.issue.update({
            where: {
                id: input.issueId,
            },
            data: {
                assignees: {
                    disconnect: {
                        id: input.userId
                    },
                },
            },
        });
    }),
});