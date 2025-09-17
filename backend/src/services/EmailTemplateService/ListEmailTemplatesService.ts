import { Op, Sequelize } from "sequelize";
import EmailTemplate from "../../models/EmailTemplate";
import User from "../../models/User";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
  active?: boolean;
}

interface Response {
  templates: EmailTemplate[];
  count: number;
  hasMore: boolean;
}

const ListEmailTemplatesService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
  active
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (active !== undefined) {
    whereCondition.active = active;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      {
        description: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("description")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      {
        subject: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("subject")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      }
    ];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: templates } = await EmailTemplate.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  const hasMore = count > offset + templates.length;

  return {
    templates,
    count,
    hasMore
  };
};

export default ListEmailTemplatesService;