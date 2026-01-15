// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};

async function setupPublicPermissions(strapi: any) {
  try {
    // Obtener todos los roles
    const roles = await strapi.query('plugin::users-permissions.role').findMany();
    
    // Buscar el rol Public
    const publicRole = roles.find((role: any) => role.type === 'public');
    
    if (!publicRole) {
      console.log('Rol public no encontrado');
      return;
    }

    console.log('Configurando permisos públicos para home-page, product y order...');

    // Endpoints a habilitar para el público
    const endpoints = [
      'api::home-page.home-page.find',
      'api::home-page.home-page.findOne',
      'api::product.product.find',
      'api::product.product.findOne',
      'api::order.order.find',
      'api::order.order.findOne',
      'api::order.order.create',
    ];

    // Configurar cada endpoint
    for (const action of endpoints) {
      try {
        // Intentar actualizar si existe
        await strapi.query('plugin::users-permissions.permission').update({
          where: {
            role: publicRole.id,
            action: action,
          },
          data: { enabled: true },
        });
      } catch (err) {
        // Si no existe, crear
        try {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              role: publicRole.id,
              action: action,
              enabled: true,
            },
          });
        } catch (createErr) {
          // Ignorar errores silenciosamente
        }
      }
    }

    console.log('✓ Permisos públicos configurados correctamente');
  } catch (error) {
    console.error('Error al configurar permisos públicos:', error);
  }
}
