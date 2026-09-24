from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from xml.sax.saxutils import escape
from pathlib import Path

out = Path('output/pdf/elicitation-perguntas-e-respostas.pdf')
font_regular = r'C:\Windows\Fonts\arial.ttf'
font_bold = r'C:\Windows\Fonts\arialbd.ttf'
pdfmetrics.registerFont(TTFont('Arial', font_regular))
pdfmetrics.registerFont(TTFont('Arial-Bold', font_bold))

rounds = [
('Rodada 1 - contexto e escopo', [
('A loja venderá apenas no Brasil? Isso define moeda, idioma, cálculo de frete e requisitos de pagamento.', 'Vai vender só no Brasil.'),
('Quais formas de pagamento devem estar disponíveis no lançamento? Há algum provedor escolhido?', 'Para ter um sistema de pagamento imaginário.'),
('Como será calculado o frete e quais regiões de entrega serão atendidas?', 'Quanto mais longe, mais caro em relação ao Sudeste.'),
('O estoque será controlado por produto e variação? Quando a quantidade deve ser reservada?', 'Sim. O estoque será controlado por produto e por variação, como tamanho e cor. A quantidade será reservada quando o pagamento for aprovado.'),
('As compras poderão ser feitas como visitante, ou será obrigatório criar uma conta?', 'Será obrigatório criar uma conta para realizar a compra.'),
('Quais estados e regras devem existir para cancelamento, troca e devolução?', 'O cliente poderá solicitar cancelamento, troca ou devolução enquanto o pedido estiver dentro das regras definidas pelo sistema. O administrador será responsável por analisar e aprovar essas solicitações.'),
('Este trabalho tem alguma exigência técnica ou acadêmica, como linguagem, framework, banco de dados, prazo ou formato?', 'O trabalho deverá seguir as tecnologias e orientações definidas pela faculdade. O sistema será desenvolvido com banco de dados, autenticação, controle de acesso e interface responsiva. O prazo e o formato de entrega seguirão o que for definido pelo professor.'),
]),
('Rodada 2 - pagamento, estoque, avaliações e promoções', [
('Como o pagamento imaginário deve funcionar na demonstração? Aprovação/recusa automática ou escolha de resultado pelo cliente?', 'O pagamento será simulado. O sistema poderá aprovar ou recusar o pagamento automaticamente.'),
('Como calcular o frete? Há valores ou fórmula definidos?', 'O frete será calculado de acordo com a região do cliente. Quanto mais distante da região Sudeste, maior será o valor. Os valores exatos podem ficar definidos posteriormente.'),
('Como evitar vender a mesma unidade para dois clientes, já que o estoque só seria reservado após aprovação?', 'O sistema deve verificar o estoque antes de finalizar a compra, para evitar que dois clientes comprem o mesmo produto. A reserva será feita após a aprovação do pagamento.'),
('Quais regras limitam cancelamento, troca e devolução? Podemos deixar os detalhes pendentes?', 'O cliente poderá solicitar cancelamento, troca ou devolução dentro de um prazo definido pelo sistema. As regras detalhadas podem ser definidas posteriormente.'),
('Uma avaliação exige compra? Terá nota/comentário? Pode ser moderada?', 'Apenas clientes que compraram o produto poderão avaliá-lo. A avaliação terá nota e comentário, e poderá ser moderada pelo administrador.'),
('Promoções precisam estar no escopo? A que se aplicam?', 'Sim, devem fazer parte do sistema. Inicialmente, podem ser aplicados aos produtos, deixando regras mais complexas para uma etapa posterior.'),
]),
('Rodada 3 - concorrência e regras de operação', [
('Se dois clientes tentarem comprar a última unidade, apenas um deve avançar? Se o pagamento for recusado, o estoque volta a ficar disponível?', 'Sim. Apenas um cliente poderá avançar com a última unidade. Se o pagamento for recusado, o estoque ficará disponível novamente.'),
('Como a simulação decide aprovação ou recusa? O cliente escolhe? Deve ver o motivo da recusa?', 'O cliente poderá escolher na tela se o pagamento será aprovado ou recusado. Quando for recusado, o sistema mostrará um motivo.'),
('Quais dados de conta/endereço são necessários? O cliente poderá salvar mais de um endereço?', 'Serão necessários nome, e-mail, senha e dados básicos de endereço. O cliente poderá salvar mais de um endereço.'),
('Quais etapas de pedido aparecem para o cliente? Incluímos pagamento recusado e pedido cancelado?', 'Os principais status serão: pedido realizado, pagamento aprovado, em preparação, enviado e entregue. Também teremos pagamento recusado e pedido cancelado.'),
('Uma avaliação será permitida por cliente/produto ou pode ser refeita após nova compra? O administrador poderá ocultá-la?', 'O cliente poderá fazer uma avaliação por produto comprado. A avaliação terá nota e comentário. O administrador poderá moderar ou ocultar avaliações.'),
('Promoções precisam de datas e limite de uso? Regras de acúmulo ficam fora do escopo?', 'As promoções terão data de início e término. O limite de uso pode ser definido depois. Regras de acumulação de descontos ficarão fora do escopo inicial.'),
]),
('Rodada 4 - expiração, acesso e atendimento', [
('A retenção temporária expira se o cliente abandonar o pagamento? Qual duração?', 'Sim. A reserva deve expirar se o cliente abandonar o pagamento. O tempo exato pode ficar pendente para definir depois.'),
('O cliente precisa confirmar o e-mail? Deve haver recuperação de senha?', 'Sim, o cliente deverá confirmar o e-mail ao criar a conta. Também deverá existir recuperação de senha.'),
('Como serão criadas as contas administrativas? Os administradores terão permissões iguais?', 'A primeira conta administrativa será criada no cadastro inicial do projeto. Os administradores terão as mesmas permissões.'),
('As notificações serão por e-mail ou bastam atualizações na conta do cliente?', 'Por enquanto, basta exibir a confirmação e as atualizações de status dentro da conta do cliente. O envio de e-mails pode ficar para uma etapa futura.'),
('O frete usa UF ou CEP? Podemos deixar fórmula e valores pendentes?', 'O cálculo será feito utilizando o CEP do cliente. A fórmula e os valores por região ficarão pendentes para definição posterior.'),
]),
]

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='DocTitle', fontName='Arial-Bold', fontSize=18, leading=21, textColor=colors.HexColor('#14304A'), spaceAfter=2*mm))
styles.add(ParagraphStyle(name='SubTitle', fontName='Arial', fontSize=9.5, leading=12, textColor=colors.HexColor('#536577'), spaceAfter=2*mm))
styles.add(ParagraphStyle(name='Round', fontName='Arial-Bold', fontSize=15, leading=20, textColor=colors.HexColor('#176B70'), spaceBefore=2*mm, spaceAfter=5*mm))
styles.add(ParagraphStyle(name='Label', fontName='Arial-Bold', fontSize=9, leading=12, textColor=colors.HexColor('#176B70'), spaceBefore=2*mm, spaceAfter=1*mm))
styles.add(ParagraphStyle(name='BodyQ', fontName='Arial-Bold', fontSize=9.3, leading=12.2, textColor=colors.HexColor('#203040'), spaceAfter=1*mm))
styles.add(ParagraphStyle(name='BodyA', fontName='Arial', fontSize=9.3, leading=12.2, textColor=colors.HexColor('#263746'), leftIndent=4*mm, spaceAfter=2*mm))
styles.add(ParagraphStyle(name='Note', fontName='Arial', fontSize=9, leading=13, textColor=colors.HexColor('#536577'), backColor=colors.HexColor('#F1F6F7'), borderColor=colors.HexColor('#D4E3E5'), borderWidth=.6, borderPadding=8, spaceBefore=3*mm, spaceAfter=5*mm))

def footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(colors.HexColor('#D8E1E8'))
    canvas.line(18*mm, 15*mm, w-18*mm, 15*mm)
    canvas.setFont('Arial', 8)
    canvas.setFillColor(colors.HexColor('#667788'))
    canvas.drawString(18*mm, 10*mm, 'Loja Online - Registro da elicitação')
    canvas.drawRightString(w-18*mm, 10*mm, f'Página {doc.page}')
    canvas.restoreState()

story = [Paragraph('Elicitação de requisitos', styles['DocTitle']),
         Paragraph('Registro das perguntas do assistente e das respostas fornecidas pelo usuário', styles['SubTitle']),
         Paragraph('Registro das quatro rodadas de perguntas e respostas da entrevista de requisitos.', styles['Note'])]
for i, (title, pairs) in enumerate(rounds):
    if i:
        story.append(PageBreak())
    story.append(Paragraph(escape(title), styles['Round']))
    for n, (q, a) in enumerate(pairs, 1):
        block = [Paragraph(f'Pergunta {n}', styles['Label']), Paragraph(escape(q), styles['BodyQ']),
                 Paragraph('Resposta', styles['Label']), Paragraph(escape(a), styles['BodyA'])]
        story.append(KeepTogether(block))

doc = SimpleDocTemplate(str(out), pagesize=A4, rightMargin=19*mm, leftMargin=19*mm, topMargin=22*mm, bottomMargin=22*mm, title='Elicitação de requisitos - Loja Online', author='OpenAI Codex', subject='Perguntas e respostas da elicitação de requisitos')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(out.resolve())


