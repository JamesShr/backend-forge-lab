import { findLabById, loadAllLabs } from "../manifest/lab-manifest.loader";
import type { LabDefinition } from "../manifest/lab-manifest.type";
import { printAvailableLabs } from "./console";

export async function resolveLabOrExit(labId: string | undefined, usage: string): Promise<LabDefinition | undefined> {
  if (!labId) {
    console.error(usage);
    process.exitCode = 1;
    return undefined;
  }

  const lab = await findLabById(labId);

  if (!lab) {
    const labs = await loadAllLabs();
    console.error(`找不到 lab：${labId}`);
    console.error("");
    printAvailableLabs(labs);
    process.exitCode = 1;
    return undefined;
  }

  return lab;
}
