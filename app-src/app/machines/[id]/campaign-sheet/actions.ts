"use server";

import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/messaging/sendMessage";

export async function sendCampaignSheetEmail(machineId: string, templateKey: string) {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      model: { include: { manufacturer: true } },
      ownerships: { where: { ownedUntil: null }, include: { customer: true } },
    },
  });

  const owner = machine?.ownerships[0]?.customer;
  if (!machine || !owner) throw new Error("Maskinen eller ägaren hittades inte.");

  const log = await sendMessage({
    templateKey,
    customerId: owner.id,
    machineId: machine.id,
    variables: {
      customer_name: owner.name,
      model_name: `${machine.model.manufacturer.name} ${machine.model.modelName}`,
      serial_number: machine.serialNumber,
    },
  });

  if (log.status !== "sent") {
    throw new Error(log.errorMessage ?? "Kunde inte skicka kampanjbladet.");
  }
  return { status: log.status };
}
