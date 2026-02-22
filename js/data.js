const padariaData = {
    produtos: [
        {
            id: 'p1',
            titulo: 'Pães Artesanais',
            descricao: 'Pães frescos assados diariamente, incluindo francês, integral, pão de queijo e nossas especialidades exclusivas da casa.',
            imgSrc: 'images/pao.jpg',
            alt: 'Variedade de pães artesanais frescos',
            precoMin: '0.50',
            precoMax: '15.00'
        },
        {
            id: 'p2',
            titulo: 'Doces e Bolos',
            descricao: 'Doces caseiros, bolos de chocolate, tortas e sobremesas preparadas com receitas tradicionais da família.',
            imgSrc: 'images/doce.jpg',
            alt: 'Doces e bolos caseiros variados',
            precoMin: '2.50',
            precoMax: '45.00'
        },
        {
            id: 'p3',
            titulo: 'Salgados Especiais',
            descricao: 'Coxinhas, pastéis, esfirras e uma variedade de salgados assados e fritos preparados na hora para você.',
            imgSrc: 'images/salgado.jpg',
            alt: 'Salgados assados e fritos diversos',
            precoMin: '3.50',
            precoMax: '18.00'
        }
    ],
    precos: {
        paes: [
            { nome: 'Pão Francês', tamanho: '50g', preco: '0,80' },
            { nome: 'Pão Integral', tamanho: '500g', preco: '8,50' },
            { nome: 'Pão de Centeio', tamanho: '400g', preco: '7,20' },
            { nome: 'Pão de Queijo', tamanho: 'unidade', preco: '2,50' },
            { nome: 'Croissant', tamanho: 'unidade', preco: '4,50' },
            { nome: 'Baguete', tamanho: 'unidade', preco: '6,00' },
            { nome: 'Pão de Forma', tamanho: 'pacote 500g', preco: '7,50' },
            { nome: 'Pão Australiano', tamanho: 'unidade', preco: '8,90' }
        ],
        doces: [
            { nome: 'Bolo de Chocolate', tamanho: 'fatia', preco: '8,90' },
            { nome: 'Torta de Morango', tamanho: 'fatia', preco: '12,50' },
            { nome: 'Brigadeiro Gourmet', tamanho: 'unidade', preco: '3,50' },
            { nome: 'Pudim Caseiro', tamanho: 'fatia', preco: '6,80' },
            { nome: 'Cupcake', tamanho: 'unidade', preco: '5,20' },
            { nome: 'Mousse de Maracujá', tamanho: 'taça', preco: '7,90' },
            { nome: 'Torta de Limão', tamanho: 'fatia', preco: '9,50' },
            { nome: 'Pavê de Chocolate', tamanho: 'porção', preco: '8,20' }
        ],
        salgados: [
            { nome: 'Coxinha', tamanho: 'unidade', preco: '4,50' },
            { nome: 'Pastel Assado', tamanho: 'unidade', preco: '5,80' },
            { nome: 'Esfirra de Carne', tamanho: 'unidade', preco: '3,80' },
            { nome: 'Quiche Lorraine', tamanho: 'fatia', preco: '9,50' },
            { nome: 'Empada de Frango', tamanho: 'unidade', preco: '4,20' },
            { nome: 'Sanduíche Natural', tamanho: 'unidade', preco: '7,90' },
            { nome: 'Enroladinho de Salsicha', tamanho: 'unidade', preco: '3,20' },
            { nome: 'Folhado de Presunto e Queijo', tamanho: 'unidade', preco: '5,50' }
        ],
        bebidas: [
            { nome: 'Café Expresso', tamanho: 'xícara', preco: '3,50' },
            { nome: 'Cappuccino', tamanho: 'xícara grande', preco: '6,80' },
            { nome: 'Suco Natural', tamanho: '300ml', preco: '5,50' },
            { nome: 'Chocolate Quente', tamanho: 'xícara grande', preco: '8,20' },
            { nome: 'Água Mineral', tamanho: '500ml', preco: '2,50' },
            { nome: 'Refrigerante', tamanho: '350ml', preco: '4,00' },
            { nome: 'Suco de Laranja', tamanho: '300ml', preco: '6,50' },
            { nome: 'Chá Gelado', tamanho: '400ml', preco: '5,80' }
        ]
    }
};

// Exporta para ser usado globalmente, ou em módulos se refatorado
window.padariaData = padariaData;
