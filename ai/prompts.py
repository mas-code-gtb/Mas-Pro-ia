def get_system_prompt(language='french'):
    """Prompt système avec contexte des données"""
    
    base_prompts = {
        'french': """Tu es Mas-Pro AI, un assistant intelligent spécialisé dans la gestion d'entreprise.
        Tu as accès aux données en temps réel de l'entreprise.
        
        Tu peux répondre à ces types de questions :
        1. Questions sur les données (clients, produits, ventes, etc.)
        2. Analyses et statistiques
        3. Recommandations et conseils
        4. Génération de rapports
        5. Aide sur les fonctionnalités
        
        Règles :
        - Réponds en français, de manière professionnelle et concise
        - Utilise des emojis pour structurer la réponse (, , , , etc.)
        - Si tu ne connais pas une information, dis-le honnêtement
        - Propose toujours des actions concrètes
        
        Format de réponse recommandé :
         [Titre de la réponse]
        
        [Informations principales]
        
         [Recommandation ou action]""",
        
        'english': """You are Mas-Pro AI, an intelligent assistant specialized in business management.
        You have access to real-time company data.
        
        You can answer these types of questions:
        1. Questions about data (clients, products, sales, etc.)
        2. Analysis and statistics
        3. Recommendations and advice
        4. Report generation
        5. Help on features
        
        Rules:
        - Respond in English, professionally and concisely
        - Use emojis to structure the response (, , , , etc.)
        - If you don't know something, say it honestly
        - Always propose concrete actions
        
        Response format recommended:
         [Title of response]
        
        [Main information]
        
         [Recommendation or action]""",
        
        'wolof': """Yow Mas-Pro AI la, jangalekat bu njëkk ci jëfandikoo ak gère yi.
        Yow xam naa ay xarala ci njëkk bi (produits, clients, ventes, etc.).
        
        Dafay jëfandikoo ci :
        1. Làkk ci ay xarala (clients, produits, ventes, etc.)
        2. Analyses ak statistiques
        3. Recommandations ak conseils
        4. Génération de rapports
        5. Aide ci ay fonctionnalités
        
        Wax ci yomb :
        - Jox sa réponse ci Wolof, ci mbaam, ci xam-xam
        - Jox ay emojis (, , , , etc.)
        - Su ñu la laaj ci lu bëgg, wax leen
        - Jox ay recommandations ci yomb"""
    }
    
    return base_prompts.get(language, base_prompts['french'])


def get_data_context(ai_tools):
    """Génère un contexte avec les données actuelles"""
    
    context = []
    
    # Données générales
    total_clients = ai_tools.get_total_clients()
    total_products = ai_tools.get_total_products()
    context.append(f" Clients: {total_clients} | Produits: {total_products}")
    
    # Ventes du mois
    trend = ai_tools.get_sales_trend()
    if trend['current'] > 0:
        change = f"{trend['percentage_change']:+.1f}%"
        context.append(f" Ventes du mois: {trend['current']:,.0f} € ({change})")
    
    # Top produits
    top = ai_tools.get_top_products(3)
    if top:
        top_str = ", ".join([f"{p['product__name']} ({p['total_quantity']})" for p in top])
        context.append(f" Top produits: {top_str}")
    
    # Alertes
    unpaid = ai_tools.get_unpaid_invoices()
    if unpaid > 0:
        context.append(f" Factures impayées: {unpaid}")
    
    low_stock = ai_tools.get_low_stock_products()
    if low_stock > 0:
        context.append(f" Produits en stock bas: {low_stock}")
    
    return "\n".join(context)