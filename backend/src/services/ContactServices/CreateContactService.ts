// src/services/ContactServices/CreateContactService.ts - CORRIGIDO
import AppError from "../../errors/AppError";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";
import { normalizePhoneForWhatsApp } from "../../utils/phoneNormalizer";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Wallet {
  walletId: number | string;
  contactId: number | string;
  companyId: number | string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  companyId: number;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  wallets?: null | number[] | string[];
  birthDate?: Date | string; // 🎂 NOVO CAMPO ADICIONADO
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  birthDate, // 🎂 INCLUIR NO DESTRUCTURING
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = [],
  remoteJid = "",
  wallets
}: Request): Promise<Contact> => {

  // Normalizar número de telefone para formato WhatsApp brasileiro
  const normalizedNumber = normalizePhoneForWhatsApp(number);

  console.log('number original:', number)
  console.log('number normalizado:', normalizedNumber)
  console.log('remoteJid', remoteJid)

  const numberExists = await Contact.findOne({
    where: { number: normalizedNumber, companyId }
  });
  
  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const settings = await CompaniesSettings.findOne({
    where: { companyId }
  });

  const acceptAudioMessageContact =
    settings?.acceptAudioMessageContact === "enabled";

  // 🎂 PROCESSAR DATA DE NASCIMENTO
  let processedBirthDate: Date | null = null;
  if (birthDate) {
    if (typeof birthDate === 'string') {
      // Se vier no formato ISO com timezone, pegar apenas a data
      const dateOnly = birthDate.split('T')[0];
      // Adicionar meio-dia para evitar problemas de timezone
      processedBirthDate = new Date(dateOnly + 'T12:00:00');
    } else if (birthDate instanceof Date) {
      // Se for objeto Date, criar nova data com meio-dia
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth();
      const day = birthDate.getDate();
      processedBirthDate = new Date(year, month, day, 12, 0, 0);
    }
  }

  const contact = await Contact.create(
    {
      name,
      number: normalizedNumber, // Usar número normalizado
      email,
      birthDate: processedBirthDate, // 🎂 INCLUIR NO CREATE
      acceptAudioMessage: acceptAudioMessageContact,
      active,
      companyId,
      remoteJid
    },
    {
      include: ["extraInfo"]
    }
  );

  if (extraInfo && extraInfo.length > 0) {
    for (const info of extraInfo) {
      await ContactCustomField.create({
        name: info.name,
        value: info.value,
        contactId: contact.id
      });
    }
  }
  
  if (wallets) {
    await ContactWallet.destroy({
      where: {
        companyId,
        contactId: contact.id
      }
    });

    const contactWallets: Wallet[] = [];
    wallets.forEach((wallet: any) => {
      contactWallets.push({
        walletId: !wallet.id ? wallet : wallet.id,
        contactId: contact.id,
        companyId
      });
    });

    await ContactWallet.bulkCreate(contactWallets);
  }

  await contact.reload({
    include: ["extraInfo",
      {
        association: "wallets",
        attributes: ["id", "name"]
      },
    ]
  });

  return contact;
};

export default CreateContactService;