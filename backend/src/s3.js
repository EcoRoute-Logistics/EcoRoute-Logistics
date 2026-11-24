import "dotenv/config";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const cliente = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const BUCKET = process.env.S3_BUCKET;

export async function subirArchivo({ buffer, mimetype, nombreOriginal, carpeta }) {
  const extension = path.extname(nombreOriginal).toLowerCase();
  const clave = `${carpeta}/${randomUUID()}${extension}`;
  await cliente.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: clave, Body: buffer, ContentType: mimetype })
  );
  return clave;
}

export async function urlTemporal(clave, segundos = 300) {
  return getSignedUrl(
    cliente,
    new GetObjectCommand({ Bucket: BUCKET, Key: clave }),
    { expiresIn: segundos }
  );
}