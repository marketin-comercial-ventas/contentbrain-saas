import { createDb } from "@/server/db/client";
import { companies, companyBrain, products, audiences, campaigns, leads, vacancies, candidates, memberships, users } from "@/server/db/schema";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { config } from "dotenv";

config({ path: ".env.local" });

const scryptAsync = promisify(scrypt);

const testDbUrl = process.env.TEST_DATABASE_URL!;
const dbUrl = "postgres://postgres:PgTest!2026@127.0.0.1:5432/app_development";
const { db } = createDb(dbUrl);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}:${salt}`;
}

async function seed() {
  console.log("🌱 Iniciando seed de datos demo...");

  // 1. Crear usuario demo
  const passwordHash = await hashPassword("demo123456");
  const [demoUser] = await db.insert(users).values({
    email: "demo@empresa.com",
    passwordHash,
    name: "Usuario Demo",
    status: "active",
  }).returning();
  console.log("✅ Usuario demo creado:", demoUser.email);

  // 2. Crear empresa demo
  const [demoCompany] = await db.insert(companies).values({
    name: "Empresa Demo",
    slug: "empresa-demo",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
  }).returning();
  console.log("✅ Empresa demo creada:", demoCompany.name);

  // 3. Crear membresía owner
  await db.insert(memberships).values({
    userId: demoUser.id,
    companyId: demoCompany.id,
    role: "owner",
  });
  console.log("✅ Membresía owner creada");

  // 4. Crear Company Brain
  await db.insert(companyBrain).values({
    companyId: demoCompany.id,
    name: "Empresa Demo",
    description: "Empresa de demostración para mostrar las capacidades de ContentBrain SaaS.",
    industry: "Tecnología / SaaS",
    valueProposition: "Automatizamos la creación de contenido de marketing con IA, ahorrando horas de trabajo manual.",
    targetAudience: "PYMEs y startups que necesitan escalar su contenido sin contratar agencias.",
    tone: "profesional pero cercano",
    website: "https://empresa-demo.com",
    whatsapp: "+54 9 11 1234 5678",
    socialLinkedin: "https://linkedin.com/company/empresa-demo",
    socialInstagram: "https://instagram.com/empresa.demo",
    socialTwitter: "https://twitter.com/empresa_demo",
    products: ["ContentBrain Pro", "ContentBrain Enterprise"],
    services: ["Consultoría de contenido", "Implementación IA", "Capacitación equipos"],
  });
  console.log("✅ Company Brain configurado");

  // 5. Crear productos
  const [product1] = await db.insert(products).values({
    companyId: demoCompany.id,
    name: "ContentBrain Pro",
    description: "Plataforma SaaS de generación de contenido con IA para equipos de marketing.",
    category: "suscripcion",
    price: 9900,
    currency: "USD",
    benefits: ["Generación ilimitada de posts", "10+ tipos de contenido", "Integración con redes sociales", "Analytics básico"],
    features: ["IA GPT-4o", "Plantillas personalizables", "Programación de posts", "Colaboración en equipo"],
    status: "active",
  }).returning();

  const [product2] = await db.insert(products).values({
    companyId: demoCompany.id,
    name: "Consultoría de Contenido IA",
    description: "Servicio experto para implementar IA en tu estrategia de contenido.",
    category: "servicio",
    price: 250000,
    currency: "USD",
    benefits: ["Auditoría completa", "Estrategia personalizada", "Capacitación del equipo", "Soporte 3 meses"],
    features: ["Workshop inicial", "Configuración de prompts", "Revisión de outputs", "Documentación de procesos"],
    status: "active",
  }).returning();
  console.log("✅ Productos creados:", product1.name, product2.name);

  // 6. Crear audiencias
  const [audience1] = await db.insert(audiences).values({
    companyId: demoCompany.id,
    name: "Marketing Managers B2B",
    description: "Gerentes de marketing en empresas B2B que buscan escalar contenido.",
    avatarName: "María González",
    demographics: { edad: "30-45", genero: "Femenino", ubicacion: "Latam", ingresos: "USD 50k-100k", cargo: "Marketing Manager / Director" },
    needs: ["Escalar producción de contenido", "Reducir costos de agencia", "Mantener calidad de marca", "Medir ROI de contenido"],
    pains: ["Equipo pequeño para mucho contenido", "Agencias caras y lentas", "Falta de ideas frescas", "Difícil medir resultados"],
    motivations: ["Ser reconocida como innovadora", "Liberar tiempo para estrategia", "Demostrar ROI a dirección"],
    objections: ["¿La IA mantiene mi voz de marca?", "¿Es seguro para datos confidenciales?", "¿Mi equipo sabrá usarlo?"],
    tone: "profesional pero cercano",
    cta: "Agenda una demo gratuita",
  }).returning();

  const [audience2] = await db.insert(audiences).values({
    companyId: demoCompany.id,
    name: "Fundadores de Startups",
    description: "Founders early-stage que necesitan contenido pero no tienen equipo de marketing.",
    avatarName: "Carlos Rodríguez",
    demographics: { edad: "25-40", genero: "Masculino", ubicacion: "Latam/US", ingresos: "Variable", cargo: "Founder / CEO" },
    needs: ["Contenido para redes sociales", "Artículos de blog para SEO", "Newsletter para inversores", "Pitch decks"],
    pains: ["No tengo tiempo para escribir", "No sé qué publicar", "Contratar es caro", "Inconsistencia en publicaciones"],
    motivations: ["Ganar visibilidad", "Atraer inversores", "Construir autoridad", "Automatizar marketing"],
    objections: ["¿Funciona para mi nicho específico?", "¿Puedo editar lo que genera la IA?", "¿Cuánto tiempo me ahorra realmente?"],
    tone: "directo y práctico",
    cta: "Prueba gratis 14 días",
  }).returning();
  console.log("✅ Audiencias creadas:", audience1.name, audience2.name);

  // 7. Crear campaña
  const [campaign1] = await db.insert(campaigns).values({
    companyId: demoCompany.id,
    name: "Lanzamiento ContentBrain Pro Q4",
    objective: "Generar 100 leads calificados para demo en Q4",
    productId: product1.id,
    audienceId: audience1.id,
    channel: "linkedin",
    startDate: new Date("2026-10-01"),
    endDate: new Date("2026-12-31"),
    status: "active",
  }).returning();
  console.log("✅ Campaña creada:", campaign1.name);

  // 8. Crear leads
  const leadData = [
    { name: "Ana Martínez", phone: "+54 9 11 2345 6789", email: "ana@techcorp.com", company: "TechCorp", source: "linkedin" as const, status: "calificado" as const, campaignId: campaign1.id, notes: "Interesada en plan Enterprise", value: 50000 },
    { name: "Roberto Silva", phone: "+52 55 1234 5678", email: "roberto@startupmx.com", company: "StartupMX", source: "website" as const, status: "propuesta" as const, campaignId: campaign1.id, notes: "Solicitó demo para equipo de 5", value: 25000 },
    { name: "Carolina Vargas", phone: "+57 300 123 4567", email: "caro@fintechco.com", company: "FintechCo", source: "referral" as const, status: "ganado" as const, campaignId: campaign1.id, notes: "Contrató plan Pro anual", value: 9900 },
    { name: "Diego Herrera", phone: "+56 9 8765 4321", email: "diego@ecom.cl", company: "EcomChile", source: "organic" as const, status: "nuevo" as const, notes: "Descargó whitepaper", value: 0 },
    { name: "Laura Méndez", phone: "+593 99 123 4567", email: "laura@agencia.ec", company: "Agencia Creativa", source: "instagram" as const, status: "contactado" as const, notes: "Quiere info para clientes", value: 15000 },
  ];

  for (const ld of leadData) {
    await db.insert(leads).values({ companyId: demoCompany.id, ...ld });
  }
  console.log("✅ Leads creados:", leadData.length);

  // 9. Crear vacantes
  const [vacancy1] = await db.insert(vacancies).values({
    companyId: demoCompany.id,
    title: "Ejecutivo Comercial SaaS",
    description: "Buscamos un ejecutivo comercial con experiencia en venta consultiva de software B2B.",
    location: "Buenos Aires, Argentina (híbrido)",
    modality: "hibrido",
    salaryMin: 25000,
    salaryMax: 40000,
    currency: "USD",
    requirements: ["3+ años venta SaaS B2B", "Inglés avanzado", "CRM (HubSpot/Salesforce)", "Historial de cuota cumplida"],
    status: "published",
  }).returning();

  const [vacancy2] = await db.insert(vacancies).values({
    companyId: demoCompany.id,
    title: "Desarrollador Full Stack (React/Node)",
    description: "Desarrollador para escalar nuestra plataforma de IA generativa.",
    location: "Remoto (Latam)",
    modality: "remoto",
    salaryMin: 35000,
    salaryMax: 55000,
    currency: "USD",
    requirements: ["React, TypeScript, Node.js", "PostgreSQL, Prisma/Drizzle", "Experiencia con APIs de IA", "Testing automatizado"],
    status: "published",
  }).returning();
  console.log("✅ Vacantes creadas:", vacancy1.title, vacancy2.title);

  // 10. Crear candidatos
  const candidateData = [
    { name: "Patricia López", email: "patricia.lopez@email.com", phone: "+54 9 11 3333 4444", cvUrl: "https://drive.com/cv-patricia.pdf", experience: "5 años venta SaaS en HubSpot y Salesforce. Cuota 120% último año.", skills: ["SaaS Sales", "HubSpot", "Salesforce", "Venta Consultiva", "Inglés C1"], source: "linkedin", status: "entrevista" as const, vacancyId: vacancy1.id },
    { name: "Miguel Torres", email: "miguel.torres@email.com", phone: "+52 55 2222 3333", cvUrl: "https://drive.com/cv-miguel.pdf", experience: "4 años React/Node. Proyectos con OpenAI API y PostgreSQL.", skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "OpenAI API", "Testing"], source: "website", status: "preseleccion" as const, vacancyId: vacancy2.id },
    { name: "Sofía Ramírez", email: "sofia.ramirez@email.com", phone: "+57 300 555 6666", cvUrl: "https://drive.com/cv-sofia.pdf", experience: "3 años Customer Success en SaaS. Gestión 50+ cuentas enterprise.", skills: ["Customer Success", "HubSpot", "Renovaciones", "Upsell"], source: "referral", status: "finalista" as const, vacancyId: vacancy1.id },
    { name: "Andrés Castro", email: "andres.castro@email.com", phone: "+56 9 7777 8888", cvUrl: "https://drive.com/cv-andres.pdf", experience: "2 años Frontend. React, Next.js, Tailwind. Portfolio en GitHub.", skills: ["React", "Next.js", "Tailwind", "TypeScript"], source: "direct", status: "nuevo" as const, vacancyId: vacancy2.id },
    { name: "Valentina Ruiz", email: "valentina.ruiz@email.com", phone: "+593 99 222 3333", cvUrl: "https://drive.com/cv-valentina.pdf", experience: "6 años B2B Sales. Ex-Google Cloud. Manejo ciclos complejos.", skills: ["Enterprise Sales", "Google Cloud", "Negociación", "Inglés Nativo"], source: "linkedin", status: "oferta" as const, vacancyId: vacancy1.id },
  ];

  for (const cd of candidateData) {
    await db.insert(candidates).values({ companyId: demoCompany.id, ...cd });
  }
  console.log("✅ Candidatos creados:", candidateData.length);

  console.log("\n🎉 SEED COMPLETADO");
  console.log("=====================================");
  console.log("Usuario: demo@empresa.com / demo123456");
  console.log("Empresa: Empresa Demo (empresa-demo)");
  console.log("Productos: 2 | Audiencias: 2 | Campañas: 1");
  console.log("Leads: 5 | Vacantes: 2 | Candidatos: 5");
  console.log("=====================================");
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});