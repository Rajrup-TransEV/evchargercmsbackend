// all of charger related crud operatoins has been written inside this file

import { PrismaClient } from "@prisma/client";
import generateRandomUID from "../../../lib/generaterandomuid.js";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import saveqrcode from "../../../lib/saveqrcode.js";
import getNextCounterValue from "../../../lib/serialnumbergen.js";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config()

const prisma = new PrismaClient();
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN
const asssign_buy_charger = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "charger_unit_ops.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {
        Chargerserialnum, ChargerName, Chargerhost, Segment, Subsegment, Total_Capacity,
        Chargertype, parking, number_of_connectors, Connector_type, connector_total_capacity,
        lattitude, longitute, full_address, charger_use_type,
        twenty_four_seven_open_status, charger_image, chargerbuyer, chargeridentity
    } = req.body;

    const ranuid = generateRandomUID();

    try {
       

        const usersearch = await prisma.userProfile.findFirst({
            where: { email: chargerbuyer },
            select: { uid: true }
        });

        if (!usersearch) {
            logging("error", "User not found with the provided chargerbuyer email.", "charger_unit_ops.js");
            return res.status(404).json({ message: "User not found with the given email" });
        }

        const appen = await getNextCounterValue();
        const appenddata = `${chargeridentity}-${appen}`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lattitude},${longitute}`;

        // Handle base64 image data
        let imageFilePath = null;
        let normalizepathch = null;
        if (charger_image) {
            const base64Data = charger_image.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const imageName = `${ranuid}-${crypto.randomUUID()}.png`;
            imageFilePath = path.join('chargerimages', imageName);
            normalizepathch = imageFilePath.replace(/\\/g, '/');
            fs.writeFileSync(imageFilePath, buffer);
        }

        const newChargerUnit = await prisma.charger_Unit.create({
            data: {
                Chargerserialnum,
                ChargerName,
                uid: ranuid,
                Chargerhost,
                Segment,
                Subsegment,
                Total_Capacity,
                Chargertype,
                parking,
                number_of_connectors,
                Connector_type,
                connector_total_capacity,
                lattitude,
                longitute,
                full_address,
                charger_use_type,
                twenty_four_seven_open_status,
                charger_image: normalizepathch,
                chargeridentity: appenddata,
                userId: usersearch.uid,
                googlemapslink: googleMapsUrl,
                associatedadminid:ASSOCIATED_ADMINID
            }
        });

        if (!newChargerUnit) {
            logging("error", "Charger operations not available at this moment", "charger_unit_ops.js");
            return res.status(503).json("Charger operations not available at this moment");
        }

        const associateuserfetch = await prisma.userProfile.findFirstOrThrow({
            where: { email: chargerbuyer },
            select: { email: true, firstname: true }
        });

        const to = associateuserfetch.email;
        const subject = "Thank you for buying a charger";
        const text = `Hello - ${associateuserfetch.firstname},\n\nThanks for ordering a new charger.\n\nYour order details are:\n
        Charger Name: ${ChargerName}
        Charger Host: ${Chargerhost}
        Segment: ${Segment}
        Subsegment: ${Subsegment}
        Total Capacity: ${Total_Capacity}
        Charger Type: ${Chargertype}
        Parking: ${parking}
        Number of Connectors: ${number_of_connectors}
        Connector Type: ${Connector_type}
        Connector Total Capacity: ${connector_total_capacity}
        Latitude: ${lattitude}
        Longitude: ${longitute}
        Full Address: ${full_address}
        Use Type: ${charger_use_type}
        24/7 Open: ${twenty_four_seven_open_status}
        Location on Google Maps: ${googleMapsUrl}
        `;

        await emailQueue.add({ to, subject, text }, {
            attempts: 5,
            backoff: 10000
        });

        logging("success", "Charger unit has been created successfully", "charger_unit_ops.js");

            // Prepare full charger data for QR code (excluding sensitive or large fields like image)
        const qrcodedata = {
            uid: ranuid,
            Chargerserialnum,
            ChargerName,
            Chargerhost,
            Segment,
            Subsegment,
            Total_Capacity,
            Chargertype,
            parking,
            number_of_connectors,
            Connector_type,
            connector_total_capacity,
            lattitude,
            longitute,
            full_address,
            charger_use_type,
            twenty_four_seven_open_status,
            chargeridentity: appenddata,
            googlemapslink: googleMapsUrl,
            associatedadminid: ASSOCIATED_ADMINID,
            userId: usersearch.uid
        };

        // Convert object to JSON string to encode into QR
        const qrStringData = JSON.stringify(qrcodedata);

        // Save QR code with full charger data
        const qrcodeBuffer = await saveqrcode(qrStringData);
        const normalizedQrcodePath = qrcodeBuffer.qrCodePath.replace(/\\/g, '/');

        await prisma.qRCode.create({
            data: {
                uid: crypto.randomUUID(),
                chargerid: ranuid,  // Keep ranuid as chargerid
                qrcodedata: normalizedQrcodePath
            },
            select: {
                qrcodedata: true
            }
        });

        const chargerocppur = `ws://srv586896.hstgr.cloud/${ranuid}`;

        return res.status(201).json({
            message: "Charger unit has been created successfully",
            ocppurl: chargerocppur,
            google_maps_url: googleMapsUrl
        });

    } catch (error) {
        console.log(error);
        logging("error", `${error}`, "charger_unit_ops.js");
        return res.status(500).json({ message: 'An error occurred while processing', error: `${error}` });
    }
}

export default asssign_buy_charger;
