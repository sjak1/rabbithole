import {
  appendMessageToBranch,
  getMessagesForBranch,
  setBranchParent,
  getBranchParent,
  deleteBranch,
  setBranchTitle,
  createBranch,
} from "./chatController";

import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

// 🛠️ Fake Express `res` with logging
const fakeRes = {
  json: (data: any) => {
    console.log("✅ Response:");
    console.dir(data, { depth: null });
  },
  status: (code: number) => ({
    json: (data: any) => {
      console.error(`❌ Error ${code}:`, data);
    },
  }),
} as unknown as Response;

(async () => {
  console.log("\n--- ✅ Creating base test branch ---");
  const branchId = uuidv4();
  await createBranch(
    {
      body: {
        branchId,
        name: "Test Branch 🧪",
      },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Testing appendMessageToBranch ---");
  await appendMessageToBranch(
    {
      params: { branchId },
      body: {
        message: {
          role: "user",
          content: "Appending from test runner 💬",
        },
      },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Testing getMessagesForBranch ---");
  await getMessagesForBranch(
    {
      params: { branchId },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Creating parent-child branches ---");
  const parentId = uuidv4();
  const childId = uuidv4();

  await createBranch(
    {
      body: {
        branchId: parentId,
        name: "Parent Branch 🧱",
      },
    } as Request,
    fakeRes
  );

  await createBranch(
    {
      body: {
        branchId: childId,
        name: "Child Branch 🧸",
      },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Testing setBranchParent ---");
  await setBranchParent(
    {
      body: {
        childId,
        parentId,
      },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Testing getBranchParent ---");
  await getBranchParent(
    {
      params: { branchId: childId },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Testing setBranchTitle ---");
  await setBranchTitle(
    {
      params: { branchId },
      body: { title: "Updated Test Title ✍️" },
    } as Request,
    fakeRes
  );

  console.log("\n--- ✅ Creating then Deleting a branch ---");
  const branchToDelete = uuidv4();
  await createBranch(
    {
      body: {
        branchId: branchToDelete,
        name: "To Be Deleted ❌",
      },
    } as Request,
    fakeRes
  );

  await deleteBranch(
    {
      params: { branchId: branchToDelete },
    } as Request,
    fakeRes
  );

  console.log("\n🎉 All tests completed.");
})();

