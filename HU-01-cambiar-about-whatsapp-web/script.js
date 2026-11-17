async page => {
  // Ejecutar con playwright-cli en la sesión persistente del titular.
  // No escribe texto, no pulsa Guardar y no modifica datos de la cuenta.
  const out = 'C:/Users/bc.vpalacios/Documents/Tests/HU-01-cambiar-about-whatsapp-web/capturas/';
  const nombreCuenta = 'Val \u2060♡';
  const pausa = () => page.waitForTimeout(1000 + Math.random() * 1500);
  const panelDesdeTitulo = titulo => page
    .getByRole('heading', { name: titulo, exact: true })
    .locator('xpath=ancestor::header/parent::*');

  await page.goto('https://web.whatsapp.com/');
  const tu = page.getByRole('button', { name: 'Tú', exact: true });
  await tu.waitFor({ timeout: 60000 });
  await pausa();
  await page.getByRole('banner').first().screenshot({
    path: out + '01-acceso-perfil.png'
  });
  await pausa();

  await tu.click();
  await page.getByRole('heading', { name: nombreCuenta, exact: true }).waitFor();
  const abrirPerfil = page.getByRole('button', {
    name: /^Perfil Nombre, foto del perfil(?:, nombre de usuario)?$/
  });
  await abrirPerfil.waitFor();
  await pausa();
  await panelDesdeTitulo(nombreCuenta).screenshot({
    path: out + '02-menu-cuenta.png'
  });
  await pausa();

  await abrirPerfil.click();
  await page.getByRole('heading', { name: 'Editar perfil', exact: true }).waitFor();
  const perfil = panelDesdeTitulo('Editar perfil');
  await perfil.getByText(nombreCuenta, { exact: true }).waitFor();
  const editarAbout = perfil.getByRole('button', {
    name: 'Botón de editar para la creación de estados de texto', exact: true
  });
  await editarAbout.waitFor();
  await pausa();
  // La fila del teléfono se localiza desde su botón, sin copiar el número.
  const filaTelefono = perfil.getByRole('button', {
    name: 'Copiar número de teléfono', exact: true
  }).locator('../../../..');
  await filaTelefono.waitFor();
  await perfil.screenshot({
    path: out + '03-editar-perfil.png',
    mask: [filaTelefono],
    maskColor: '#D1D5DB'
  });
  await pausa();

  await editarAbout.click();
  const dialogo = page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: 'Info.', exact: true })
  });
  try {
    await dialogo.waitFor();
    const guardar = dialogo.getByRole('button', { name: 'Guardar', exact: true });
    await guardar.waitFor();
    const texto = dialogo.getByRole('textbox').and(dialogo.locator('input[type="text"]'));
    await texto.waitFor();
    const original = await texto.inputValue();
    const guardarDeshabilitado = await guardar.isDisabled();
    await pausa();
    // El role=dialog ocupa toda la pantalla; su banner permite encuadrar
    // solo la ventana de edición y excluir los datos del fondo.
    await dialogo.getByRole('banner').locator('..').screenshot({
      path: out + '04-editor-about.png'
    });
    await pausa();

    await dialogo.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await dialogo.waitFor({ state: 'hidden' });
    if (original) await perfil.getByText(original, { exact: true }).waitFor();
    await pausa();
    return {
      editorCerrado: true,
      aboutOriginalVisible: Boolean(original),
      guardarDeshabilitado,
      guardadoEjecutado: false
    };
  } finally {
    // Si falla una comprobación después de abrir, cerrar sin guardar.
    if (await dialogo.isVisible()) {
      await pausa();
      await dialogo.getByRole('button', { name: 'Cerrar', exact: true }).click();
      await dialogo.waitFor({ state: 'hidden' });
    }
  }
}
